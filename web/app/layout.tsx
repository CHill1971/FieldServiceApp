
export const metadata = { title: 'Field Service App' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{fontFamily:'Inter, system-ui, Arial', background:'#0b1020', color:'#e6e6ea'}}>
        <div style={{maxWidth:1200, margin:'0 auto', padding:16}}>
          {children}
        </div>
      </body>
    </html>
  );
}
