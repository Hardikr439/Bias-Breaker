import { CardStack } from "@/components/ui/card-stack"; // Adjust the import path as needed

const CARDS = [
  {
    id: 0,
    name: "News Summarization",
    content: (
      <p>
        Our <span className="font-bold">summarization</span> tool condenses lengthy news articles into concise summaries, saving you time.
      </p>
    ),
    designation: "Feature",
  },
  {
    id: 1,
    name: "Opinion Expression",
    content: (
      <p>
        Analyze <span className="font-bold">multiple opinions</span> in the news and understand different perspectives clearly.
      </p>
    ),
    designation: "Feature",
  },
  {
    id: 2,
    name: "Fact-Checking",
    content: (
      <p>
        Verify facts and discover <span className="font-bold">the truth</span> from every angle of the story with our fact-checking tools.
      </p>
    ),
    designation: "Feature",
  },
];

export default function CardStackDemo() {
  return (
    <div className="h-[25rem] flex items-center justify-center w-full">
      <CardStack items={CARDS} />
    </div>
  );
}
