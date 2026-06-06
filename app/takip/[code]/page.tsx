import TakipDetayClient from "./TakipDetay";

// Required for Next.js static export (output: 'export') with dynamic routes
export function generateStaticParams() {
  return [
    { code: "KRB-DEMO1234" },
    { code: "KRB-DEMO5678" },
    { code: "KRB-DEMO9012" },
    { code: "KRB-DEMO3456" },
    { code: "KRB-DEMO7890" },
  ];
}

export default function TakipDetayPage() {
  return <TakipDetayClient />;
}
