import React, { useState } from "react";
import StoryHeader from "./StoryHeader";
import ServiceAccordionList from "./ServiceAccordionList";

const StorySection = ({ sessions = [], studentData }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="relative z-10 max-w-3xl mx-auto">
      <StoryHeader studentData={studentData} sessions={sessions} />
      <ServiceAccordionList openIndex={openIndex} toggle={toggle} />
    </section>
  );
};

export default StorySection;
