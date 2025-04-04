import '../app/globals.css'; // Ensure this file exists in the /app directory
import type { Metadata } from "next";
import NavBar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "../context/AppProvider";

export const metadata: Metadata = {
  title: "My NEXT App",
  description: "CRUD base Next JS API with Laravel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body> 
        <AppProvider>
          <Toaster />
          <NavBar />
          <main className='md:bg-indigo-200'>
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}