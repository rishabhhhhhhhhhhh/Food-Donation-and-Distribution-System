
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

export default function Index() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <main>
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Connecting surplus food with those who need it most
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join our platform to help reduce food waste and support communities in need.
                Together, we can make a difference.
              </p>
              {!isAuthenticated && (
                <div className="flex gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
