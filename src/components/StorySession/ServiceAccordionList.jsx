import { services } from "./services";
import ServiceAccordionItem from "./ServiceAccordionItem";

const ServiceAccordionList = ({ openIndex, toggle }) => {
  return (
    <div className="space-y-4 mt-10">
      {services.map((service, i) => (
        <ServiceAccordionItem
          key={service.link}
          service={service}
          index={i}
          isOpen={openIndex === i}
          onClick={() => toggle(i)}
        />
      ))}
    </div>
  );
};

export default ServiceAccordionList;
