import os
import json
from typing import List, Tuple
from crewai import Agent, Crew, Task
from pydantic import BaseModel

# Ensure your API key is set
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY environment variable not set.")

class PostOutput(BaseModel):
    post: str

class ReviewOutput(BaseModel):
    verdict: str  # 'PRAISE' or 'CRITICIZE'
    reason: str

def generate_post(prompt: str, platform: str) -> str:
    # We use a higher temperature for creativity
    llm_config = {
        "model": "gpt-4o-mini", 
        "temperature": 0.2
    }
    content_length = (200, 280) if platform.lower() == "x" else (200, 500)
    
    # 1. The Generator: Forced to avoid clichés
    generator = Agent(
        role="Social Media Content Strategist",
        goal=f"Create a unique for post {platform} with length between {content_length[0]} and {content_length[1]} characters. Context: {prompt}.",
        backstory=(
            "You HATE corporate buzzwords like 'revolutionize', 'next-level', 'game-changer', or 'groundbreaking'. "
            "You speak like a real human in a Slack channel, not a marketing brochure."
            "Your posts should be clever, concise, and feel authentic." 
        ),
        verbose=False,
        llm_config=llm_config
    )
    
    # 2. The Reviewer: Harder to please
    reviewer = Agent(
        role="Cringe-Detection Reviewer",
        goal="Reject any post that looks like generic AI marketing.",
        backstory=(
            "You are a cynical tech lead. If a post uses too many emojis, "
            "starts with a rocket ship, or uses 'AI-powered' as its only personality trait, "
            "you CRITICIZE it. You only PRAISE posts that feel authentic and clever."
        ),
        verbose=False,
        llm_config=llm_config
    )

    attempts = 0
    max_attempts = 2
    last_feedback = "Initial attempt."
    final_post = ""
    final_review = ""

    while attempts <= max_attempts:
        gen_task = Task(
            description=( 
                f"Last Feedback: {last_feedback}\n"
                "Constraint: Do NOT use the word 'Revolutionize'. Do NOT use more than 1 emoji. "
                "Write it for a developer audience who appreciates innovation but hates fluff."
            ),
            agent=generator,
            expected_output="JSON with 'post' key.",
            output_json=PostOutput
        )

        review_task = Task(
            description="Is this post unique? If it's generic marketing, CRITICIZE it. If it's clever, PRAISE it.",
            agent=reviewer,
            context=[gen_task],
            expected_output="JSON with 'verdict' and 'reason' keys.",
            output_json=ReviewOutput
        )

        crew = Crew(
            agents=[generator, reviewer],
            tasks=[gen_task, review_task],
            verbose=False,
            tracing=False
        )

        result = crew.kickoff()

        # Robust Extraction Logic
        try:
            gen_out = result.tasks_output[0] #type: ignore
            rev_out = result.tasks_output[1] #type: ignore

            # Parse Post
            if gen_out.pydantic:
                final_post = gen_out.pydantic.post #type: ignore
            else:
                try:
                    data = json.loads(gen_out.raw)
                    final_post = data.get("post", gen_out.raw)
                except:
                    final_post = gen_out.raw.strip()

            # Parse Review
            if rev_out.pydantic:
                v_str = rev_out.pydantic.verdict.upper() #type: ignore
                r_str = rev_out.pydantic.reason #type: ignore
            else:
                try:
                    data = json.loads(rev_out.raw)
                    v_str = data.get("verdict", "CRITICIZE").upper()
                    r_str = data.get("reason", "Follow the JSON format.")
                except:
                    v_str = "CRITICIZE"
                    r_str = "Formatting error."

            final_review = f"{v_str}: {r_str}"
            last_feedback = r_str

            if "PRAISE" in v_str:
                return final_post
                
        except Exception as e:
            last_feedback = f"Error: {str(e)}"
        
        attempts += 1

    return final_review

def test_agent():
    context = "A backend engineer who is tired of AI hype but obsessed with local LLMs and agent orchestration. Values clean code, hates 'prompt engineering' as a buzzword, and prefers building tools that actually work over showing off flashy demos."
    
    print("--- Starting Agent Process ---\n")
    post = generate_post(context, "x")
    
    print("\n" + "="*30)
    print("FINAL POST (Cleaned):")
    print(post)
    print("="*30)
    print("\nCRITIC SAYS:")
    # print(review)
    
if __name__ == "__main__":
    test_agent()