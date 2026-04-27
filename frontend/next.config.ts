
import type { NextConfig } from "next";


// const nextConfig: NextConfig = {
//   /* config options here */
//   allowedDevOrigins: ["127.0.0.1"],
// }; 

// const nextConfig: NextConfig =  {
//   output: 'export', // Creates the 'out' folder
//   // trailingSlash: true, // Recommended for S3/CloudFront routing
//   images: {
//     unoptimized: true, // S3 can't optimize images on the fly
//   },
// };

const nextConfig: NextConfig = {
  output: 'standalone', // This is the secret sauce
}

module.exports = nextConfig;