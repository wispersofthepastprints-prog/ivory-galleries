import Link from 'next/link'

export default function Page() {
  return (
    <main style={{maxWidth:760, margin:'0 auto', padding:'48px 20px 80px', fontFamily:'system-ui, sans-serif', color:'#2B2B2B', lineHeight:1.7}}>
      <Link href="/" style={{color:'#C9A227', textDecoration:'none', fontWeight:600}}>&larr; Back to Ivory Galleries</Link>
      <h1 style={{fontSize:32, margin:'20px 0 4px'}}>Privacy Policy</h1>
      <p style={{color:'#8A857A', fontSize:14, marginBottom:28}}>Ivory Galleries by Whispers of the Past &middot; Last updated: November 2026</p>
      
      <h2>1. What Ivory Galleries Stores</h2>
      <p>Ivory Galleries stores: your account details (name, email), your business branding settings, and the photographs you upload to your galleries. We process these files only to store and deliver them, and to provide the downloads or watermarks you configure.</p>
      <h2>2. Photos of Other People</h2>
      <p>You are responsible for having the right to upload your images — including portraits of third parties such as wedding guests. We process these solely as your storage and delivery provider. If an identifiable person in a hosted gallery asks for their image to be removed, contact us and we will take it down promptly.</p>
      <h2>3. What We Never Do</h2>
      <p>We do not sell your data, use your photographs to train AI models, run advertising against your galleries, or grant access to a private gallery except through the share links, passwords, and paid-access controls you configure.</p>
      <h2>4. Payments</h2>
      <p>Gallery unlock purchases and subscriptions are processed by Stripe. We never see or store full card numbers.</p>
      <h2>5. Security</h2>
      <p>All traffic is encrypted in transit (HTTPS/TLS). Galleries are unlisted by default — accessible only to people you share the link with, plus optional passwords and download controls you configure per gallery.</p>
      <h2>6. Product Measurement</h2>
      <p>We record privacy-conscious product events such as page visits, signup, gallery creation, and upgrade starts. We use normalised page paths rather than full gallery URLs, and we do not include gallery names, client names, email addresses, query strings, or document titles in these events. A visit to a client gallery is counted only as a generic gallery page view.</p>
      <h2>7. Your Rights (Australia)</h2>
      <p>Under the Privacy Act 1988 (Cth) you may request access to, correction of, or deletion of your personal information. Email us and we will respond within 30 days.</p>
      <h2>8. Deleting Your Data</h2>
      <p>Delete any gallery at any time — files are removed permanently. To delete your entire account and all stored data, email <a href="mailto:wispersofthepastprints@gmail.com" style={{color:'#C9A227'}}>wispersofthepastprints@gmail.com</a> from your registered address.</p>
      <h2>9. Changes</h2>
      <p>Material changes to this policy will be announced by email and on this page before they take effect.</p>

      <hr style={{border:'none', borderTop:'1px solid #E0D9C8', margin:'36px 0'}} />
      <p style={{fontSize:14}}><strong>Contact:</strong> <a href="mailto:wispersofthepastprints@gmail.com" style={{color:'#C9A227'}}>wispersofthepastprints@gmail.com</a> &middot; Glen Innes, NSW, Australia &middot; ABN 28 489 379 023</p>
    </main>
  );
}
