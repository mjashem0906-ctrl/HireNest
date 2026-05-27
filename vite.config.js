// // import { defineConfig } from 'vite'
// // import react from '@vitejs/plugin-react'

// // // https://vite.dev/config/
// // export default defineConfig({
// //   plugins: [react()],
// // })

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'
// import { VitePWA } from 'vite-plugin-pwa';


// export default defineConfig({
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: 'autoUpdate',
//       manifest: {
//         name: 'JOB BRIDGE Node',
//         short_name: 'JOB BRIDGE',
//         description: 'Connecting Seekers and recruiters seamlessly in Karnataka.',
//         start_url: '/',
//         display: 'standalone',
//         background_color: '#ffffff',
//         theme_color: '#1E3A8A',
//         icons: [
//           {
//             src: '/icons/icon-512x512.png',
//             sizes: '512x512',
//             type: 'image/png'
//           },
//           {
//             src: '/icons/icon-192x192.png',
//             sizes: '192x192',
//             type: 'image/png'
//           }
//         ]
//       }
//     })
//   ],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      workbox: {
        maximumFileSizeToCacheInBytes: 3000000 // 3 MB
      },

      manifest: {
        name: 'JOB BRIDGE Node',
        short_name: 'JOB BRIDGE',
        description: 'Connecting Seekers and recruiters seamlessly in Karnataka.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1E3A8A',
        icons: [
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})