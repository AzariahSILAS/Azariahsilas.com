import Hero from "@/components/sections/Hero";
import WhatsNew from "@/components/sections/WhatsNew";
import LatestPosts from "@/components/sections/LatestPosts";
import Topics from "@/components/sections/Topics";
import Progress from "@/components/sections/Progress";
import EmailCTA from "@/components/sections/EmailCTA";

export default function HomePage() {
  return (
    <>
      {/* <Hero /> */}
      <WhatsNew />
      <LatestPosts />
      {/* <Topics /> */}
      {/* <Progress /> */}
      <EmailCTA />
    </>
  );
}
