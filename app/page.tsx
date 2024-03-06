import Link from "next/link";
import { SparkleBomb } from "./components/SparkleBomb";
import { LAYOUT_CLASSES } from "./consts";

export default function Home() {
  return (
    <main className={LAYOUT_CLASSES}>
      <SparkleBomb />
      <Link href="/team?members=tobogiorgio,troge,lextobol">
        Lookup ur team
      </Link>
    </main>
  );
}
