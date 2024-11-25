// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
     return [
      {
       source: '/',
       destination: '/auth',
       permanent: true, 
      },
     ];
    },
   };
   
   export default nextConfig;
   