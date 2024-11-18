import CardStackDemo from "./CardStackDemo"; // Adjust the import path as necessary

export default function Features() {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between w-full py-4 px-4 bg-[#F9F7F7]">
      {/* Text Section on the Left */}
      <div className="text-left lg:w-1/2 pl-8 lg:pr-12">
        <h2 className="text-6xl font-bold text-[#112D4E]">
          Discover the power of our product
        </h2>
        <p className="mt-4 text-lg text-gray-700">
          Our product is packed with exciting features designed to provide the
          best experience possible. Explore the wide range of functionalities
          available for in-depth news analysis and segmentation.
        </p>
      </div>

      {/* CardStack Section on the Right */}
      <div className="lg:w-1/2  pl-10 flex justify-center lg:justify-start items-center">
        <CardStackDemo />
      </div>
    </section>
  );
}
