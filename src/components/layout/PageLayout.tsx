import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; to?: string }[];
}

export const PageHeader = ({ title, description, breadcrumbs }: PageHeaderProps) => (
  <section className="bg-card border-b border-border">
    <div className="container mx-auto px-4 py-8">
      {breadcrumbs && (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          {breadcrumbs.map((bc, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              {bc.to ? (
                <a href={bc.to} className="hover:text-foreground transition-colors">{bc.label}</a>
              ) : (
                <span className="text-foreground font-medium">{bc.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      {description && <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>}
    </div>
  </section>
);
