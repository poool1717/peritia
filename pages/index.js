import dynamic from 'next/dynamic';

const App = dynamic(() => import('../components/Peritia'), { ssr: false });

export default function Home() {
  return <App />;
}
