import Link from "next/link";
import CategoryPills from "@/components/home/category-pills";
import FeaturedSection from "@/components/home/featured-section";
import NewArrivals from "@/components/home/new-arrivals";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Vegetables", value: "vegetables" },
  { label: "Fruits", value: "fruits" },
  { label: "Dairy", value: "dairy" },
  { label: "Bakery", value: "bakery" },
  { label: "Meats", value: "meats" },
  { label: "Beverages", value: "beverages" },
  { label: "Snacks", value: "snacks" },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--cream)" }}>
      {/* ── Hero ── */}
      <section
        className="bg-mesh relative overflow-hidden px-6 py-16 md:py-24 text-center animate-fade-up"
      >
        <p
          className="text-xs tracking-[0.3em] uppercase mb-4 font-medium"
          style={{ color: "var(--accent)" }}
        >
          Fresh · Local · Natural
        </p>
        <h1
          className="font-cormorant text-4xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-5"
          style={{ color: "var(--dark)" }}
        >
          Farm fresh,
          <br />
          <em style={{ color: "var(--accent)" }}>delivered with love</em>
        </h1>
        <p className="max-w-md mx-auto text-base mb-8" style={{ color: "var(--muted)" }}>
          Connecting local farmers and artisan sellers with conscious consumers.
          Discover natural, organic, and handcrafted products.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/explore"
            className="px-8 py-3 rounded-full text-white font-medium transition-all hover:scale-105 hover:shadow-lg"
            style={{ background: "var(--accent)" }}
          >
            Shop Now
          </Link>
          <Link
            href="/explore?category=vegetables"
            className="px-8 py-3 rounded-full font-medium border-2 transition-all hover:scale-105"
            style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
          >
            Browse Categories
          </Link>
        </div>

        {/* Promo Banner */}
        <div
          className="mt-10 mx-auto max-w-lg rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-l) 100%)",
          }}
        >
          <div className="text-left text-white">
            <p className="text-xs uppercase tracking-wider opacity-80">Limited Offer</p>
            <p className="font-cormorant text-xl font-semibold">Free delivery on first order</p>
          </div>
          <Link
            href="/explore"
            className="shrink-0 px-4 py-2 rounded-full bg-white text-sm font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Claim
          </Link>
        </div>
      </section>

      {/* ── Category Pills ── */}
      <CategoryPills categories={CATEGORIES} />

      {/* ── Featured Picks ── */}
      <section className="px-4 md:px-6 py-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-cormorant text-2xl font-semibold" style={{ color: "var(--dark)" }}>
            Featured Picks
          </h2>
          <Link href="/explore" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            See all →
          </Link>
        </div>
        <FeaturedSection />
      </section>

      {/* ── New Arrivals ── */}
      <section className="px-4 md:px-6 py-6 pb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-cormorant text-2xl font-semibold" style={{ color: "var(--dark)" }}>
            New Arrivals
          </h2>
          <Link href="/explore?sort=newest" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            See all →
          </Link>
        </div>
        <NewArrivals />
      </section>
    </div>
  );
}
