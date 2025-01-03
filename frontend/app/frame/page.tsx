export const metadata = {
  title: 'AI Agent Arena',
  description: 'AI Agent Arena Game',
  url: 'https://agent-arena.xyz',
  icons: ['https://agent-arena.xyz/logo.png'],
  other: {
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: "https://agent-arena.xyz/images/1200x630_Rich_Link_Preview_Image.png",
      button: {
        title: "Play Now",
        action: {
          type: "launch_frame", 
          name: "AI Agent Arena",
          url: "https://agent-arena.xyz",
          splashImageUrl: "https://agent-arena.xyz/logo.png",
          splashBackgroundColor: "#131313"
        }
      }
    })
  }
}

export default function Frame() {
  return <div>Frame</div>
}