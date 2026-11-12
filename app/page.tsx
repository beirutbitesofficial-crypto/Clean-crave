import { CartDrawer, OrderDock } from "@/components/Cart";
import Chrome from "@/components/Chrome";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import MacroScene from "@/components/MacroScene";
import Marquee from "@/components/Marquee";
import Menu from "@/components/Menu";
import Nav from "@/components/Nav";
import Order from "@/components/Order";
import Steps from "@/components/Steps";

export default function Home() {
  return (
    <>
      <Chrome />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <MacroScene />
        <Menu />
        <Steps />
        <Order />
      </main>
      <Footer />
      <OrderDock />
      <CartDrawer />
    </>
  );
}
