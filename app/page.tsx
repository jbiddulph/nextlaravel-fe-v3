import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex flex-col justify-between" style={{ height: "calc(100vh - 60px)" }}>
        <section className="bg-indigo-600 text-white text-center py-10 h-[400px]">
          <div className="container mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold md:mt-12">Welcome to GoSchool.uk</h1>
            <p className="text-lg mt-4">
              Find the perfect school for your children with ease.
            </p>
            <Link
              href="/auth"
              className="inline-block bg-white text-indigo-600 font-semibold py-2 px-4 rounded mt-6"
            >
              Get Started
            </Link>
          </div>
        </section>

        <section className="container mx-auto text-center my-10 px-4 md:px-0">
          <h2 className="text-4xl md:text-6xl font-bold">Why Use GoSchool.uk?</h2>
          <p className="text-gray-700 text-lg mt-4">
            GoSchool.uk provides detailed school information and locations to
            help you find the ideal school for your children. Whether you&apos;re
            commuting by car, on foot, or by bike, our platform ensures you can
            make an informed decision with ease.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center">
              <Image src="/file.svg" alt="Feature 1" width={100} height={100} />
              <h3 className="text-2xl font-semibold mt-4">Comprehensive Data</h3>
              <p className="text-gray-700 text-lg mt-2">
                Access detailed school statistics, including Ofsted ratings and
                pupil demographics.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Image src="/window.svg" alt="Feature 2" width={100} height={100} />
              <h3 className="text-2xl font-semibold mt-4">Interactive Map</h3>
              <p className="text-gray-700 text-lg mt-2">
                View school locations on an interactive map for better planning.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Image src="/globe.svg" alt="Feature 3" width={100} height={100} />
              <h3 className="text-2xl font-semibold mt-4">Commute Options</h3>
              <p className="text-gray-700 text-lg mt-2">
                Find schools that are easily commutable by car, on foot, or by
                bike.
              </p>
            </div>
          </div>
        </section>

        <footer className="bg-gray-800 text-gray-300 text-center py-6">
          <p className="text-sm">© 2025 GoSchool.uk. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}