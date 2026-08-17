import ActionButton from "../UI/ActionButton";
import { Route, BookOpen, Bot } from "lucide-react";

const buttonsData = [
  {
    text: "Start Your Journey",
    variant: "default",
    onClick: () => console.log("Start Your Journey"),
    icon: <Route className="w-5 h-5" />,
    href: "/start-journey"
  },
  {
    text: "Explore Our Story",
    variant: "secondary",
    onClick: () => console.log("Explore Our Story"),
    icon: <BookOpen className="w-5 h-5" />,
    href: "/our-story"
  },
  {
    text: "Explore AI",
    variant: "outline",
    onClick: () => console.log("Explore AI"),
    icon: <Bot className="w-5 h-5" />,
    href: "/explore-ai"
  },
];

export default function HomeActionButtons() {
  return (
    <section className="p-8">
      <ActionButton buttons={buttonsData} />
    </section>
  );
}
