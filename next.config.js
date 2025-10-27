/** @type {import('next').NextConfig} */
const nextConfig = {
  output: {
    // Set the tracing root to the project root directory
    fileTracingRoot: process.cwd(),
  },
  async headers() {
    return [
      {
        // Mengizinkan CORS untuk Express.js backend
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "http://localhost:5000" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ]
  },
}