import React from "react";
import Image from "next/image";

type Person = {
  image_src:
    | string
    | "https://i.scdn.co/image/ab6775700000ee85bfdd3efe20104d4e538070f2";
  image_alt: string | "avatar";
};

type PeopleUsingProps = {
  people: Person[];
  numberOfPeople: number;
};

const PeopleUsing = ({ people, numberOfPeople }: PeopleUsingProps) => (
  <div className="relative flex items-center gap-4 py-2">
    <div className="flex items-center gap-0">
      {people.map((person, index) => (
        <Image
          key={index}
          src={person.image_src}
          alt={person.image_alt}
          width={25}
          height={25}
          className="-4px m-0 rounded-full object-cover drop-shadow-lg"
          style={{
            margin: "0px -4px",
            borderRadius: "9999px",
          }}
        />
      ))}
    </div>
    <span className="font-inter h-auto text-left text-sm font-normal leading-4 text-white">
      <span>Join {numberOfPeople} others jamming with vibecheck! </span>
    </span>
  </div>
);

export default PeopleUsing;
