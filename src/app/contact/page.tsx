export default function ContactPage() {
  return (
    <main style={{maxWidth:680, margin:'0 auto', padding:'48px 20px 80px', fontFamily:'system-ui, sans-serif', color:'#2B2B2B', lineHeight:1.7}}>
      <a href="/" style={{color:'#C9A227', textDecoration:'none', fontWeight:600}}>&larr; Back to Ivory Galleries</a>
      <h1 style={{fontSize:32, margin:'20px 0 4px'}}>Contact Us</h1>
      <p style={{color:'#8A857A', fontSize:14, marginBottom:28}}>Ivory Galleries by Whispers of the Past</p>
      <p>Questions about Ivory Galleries, your account, a gallery unlock purchase, or a photo removal request? Email us — a real person (the founder, actually) reads every message.</p>
      <div style={{background:'#F5F1E8', borderRadius:16, padding:'24px 28px', margin:'28px 0'}}>
        <p style={{margin:'0 0 6px', fontSize:14, color:'#8A857A', textTransform:'uppercase', letterSpacing:'1px', fontWeight:700}}>Email</p>
        <p style={{margin:0, fontSize:20, fontWeight:700}}>
          <a href="mailto:wispersofthepastprints@gmail.com" style={{color:'#C9A227', textDecoration:'none'}}>wispersofthepastprints@gmail.com</a>
        </p>
        <p style={{margin:'18px 0 6px', fontSize:14, color:'#8A857A', textTransform:'uppercase', letterSpacing:'1px', fontWeight:700}}>Studio</p>
        <p style={{margin:0, fontSize:15}}>Whispers of the Past<br/>Glen Innes, NSW, Australia<br/>ABN 28 489 379 023</p>
      </div>
      <p style={{fontSize:14, color:'#8A857A'}}>We aim to reply within one business day. For urgent photo-removal requests, put "Photo removal" in the subject line.</p>
    </main>
  );
}
