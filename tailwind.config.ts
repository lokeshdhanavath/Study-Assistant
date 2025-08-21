import type { Config } from 'tailwindcss'
const config: Config = {
  content: ["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}","./lib/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { bg:'hsl(var(--bg))', fg:'hsl(var(--fg))', card:'hsl(var(--card))', border:'hsl(var(--border))', primary:'hsl(var(--primary))', 'primary-foreground':'hsl(var(--primary-foreground))', muted:'hsl(var(--muted))' },
    boxShadow:{soft:'0 8px 24px rgba(0,0,0,.08)'},
    keyframes:{'loader-rotate':{'0%':{transform:'rotate(90deg)',boxShadow:'0 10px 20px 0 #fff inset,0 20px 30px 0 #ad5fff inset,0 60px 60px 0 #471eec inset'},'50%':{transform:'rotate(270deg)',boxShadow:'0 10px 20px 0 #fff inset,0 20px 10px 0 #d60a47 inset,0 40px 60px 0 #311e80 inset'},'100%':{transform:'rotate(450deg)',boxShadow:'0 10px 20px 0 #fff inset,0 20px 30px 0 #ad5fff inset,0 60px 60px 0 #471eec inset'}}},
    animation:{loader:'loader-rotate 2s linear infinite'}
  }},
  plugins: []
}
export default config
