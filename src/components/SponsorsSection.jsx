import React from "react";
import boomtownIcon from '../assets/Trusted-by/boomtown-cottbus.svg';
import BTUIcon from '../assets/Trusted-by/BTU.svg';
import ErasmusIcon from '../assets/Trusted-by/Erasmus.svg';
import EUIcon from '../assets/Trusted-by/European Union.svg';
import IHKIcon from '../assets/Trusted-by/IHK Cottbus.svg';
import RRRIcon from '../assets/Trusted-by/RRR.svg';
import SLIcon from '../assets/Trusted-by/Startup Lausitz.webp';
import TUFIcon from '../assets/Trusted-by/tu-friedberg.svg'


const sponsors = [
{ name: "Boomtown Cottbus", icon: boomtownIcon, url:"https://www.boomtown.de/" },
{ name: "BTU", icon: BTUIcon, url:"https://www.b-tu.de/en/" },
{ name: "Erasmus", icon: ErasmusIcon, url:"https://erasmus-plus.ec.europa.eu/" },
{ name: "European Union", icon: EUIcon, url:"https://european-union.europa.eu/" },
{ name: "IHK Cottbus", icon: IHKIcon, url:"https://www.ihk.de/cottbus/" },
{ name: "RRR", icon: RRRIcon, url:"https://www.exzellent.co" },
{ name: "Startup Lausitz", icon: SLIcon, url:"https://startuplausitz.de/"},
{ name: "tu freiberg", icon: TUFIcon, url:"https://tu-freiberg.de/en" }
];

function SponsorsSection() {


return (
    <section className="py-10 bg-bg2 overflow-hidden relative z-20 border-y border-border/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
        <div className="inline-block mb-4 px-4 py-1 text-lg font-black bg-tertiary text-white rounded-full">Our Partners</div>

        <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4"><span className="text-white">Partnered with </span> Industry Leaders</h2>

        <p className="text-xl text-white font-semibold max-w-3xl mx-auto">Join professionals from top institutions who trust Exzellent for their language learning journey.</p>

        </div>

        <div className="relative overflow-hidden w-full rounded-xl bg-bg">
        
            <div className="sponsors-infinite-track flex p-5">

                {sponsors.map((sponsor) => (
                    <a href={sponsor.url} target="blank" className="w-24 h-24 hover:scale-95 mx-5 flex items-center justify-center transition-all duration-500 filter-bw-to-original cursor-pointer">
                    <img src={sponsor.icon} className="object-contain"/>
                    </a>
                ))}
                {sponsors.map((sponsor) => (
                    <a href={sponsor.url} target="blank" className="w-24 h-24 hover:scale-95 mx-5 flex items-center justify-center transition-all duration-500 filter-bw-to-original cursor-pointer">
                    <img src={sponsor.icon} className="object-contain"/>
                    </a>
                ))}

            </div>
        </div>

    </div>
    </section>
);
}

export default SponsorsSection;
