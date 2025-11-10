import SideNav from './SideNav';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <SideNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}