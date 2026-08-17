import React from 'react'
import { Lightbulb, Globe, Cpu, Rocket, Users } from 'lucide-react'

const Vision = () => {
const values = [
    {
    icon: <Cpu size={35} />,
    title: 'Advanced AI & Computing',
    desc: 'Using emerging technology to solve global challenges.'
    },
    {
    icon: <Rocket size={35} />,
    title: 'Cutting-edge R&D',
    desc: 'Pioneering breakthroughs through deep research and innovation.'
    },
    {
    icon: <Globe size={35} />,
    title: 'Accessible Tech for All',
    desc: 'Democratizing AI globally.'
    },
    {
    icon: <Users size={35} />,
    title: 'Empowering Innovation',
    desc: 'Enabling industries with transformative technologies.'
    }
]

const missions = [
    'Empower individuals to achieve their full potential.',
    'Drive Sustainable Growth and Innovation.',
    'Make a positive impact in the community.',
    'Foster a culture of collaboration and inclusivity.'
]

return (
<section className="relative z-10 my-4 max-w-7xl mx-auto">

    <div className="text-center py-6 space-y-3">
        <h2 className="text-4xl sm:text-6xl font-extrabold text-white">Building Bridges <span className="text-secondary">Across Cultures</span></h2>
        <p className="text-lg text-text-secondary font-semibold mx-auto">
            At exzellent, we believe in breaking down language barriers and building a global community of learners who are confident, skilled and ready to embrace 
            new opportunities.
        </p>
    </div>

    <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {values.map((value, idx) => (
            <div key={idx} className="bg-gradient-to-tr from-bg2 to-bg p-6 rounded-xl text-center hover:scale-105 transition-all duration-300 border border-border/20">
                <div className="flex justify-center mb-4 text-primary">{value.icon}</div>
                <h3 className="text-lg font-semibold text-white">{value.title}</h3>
                <p className="text-sm text-white font-semibold mt-2">{value.desc}</p>
            </div>
            ))}
        </div>

        <div className=" rounded-xl p-6 z-10">
            <h3 className="text-2xl font-bold text-white text-center mb-4">Our <span className="text-tertiary">Mission</span></h3>
            <ul className="grid sm:grid-cols-2 gap-3 text-white text-base max-w-4xl mx-auto">
                {missions.map((mission, idx) => (
                    <li key={idx} className="flex flex-col sm:flex-row items-center text-center gap-1"><Lightbulb className="w-5 h-5 text-tertiary" />{mission}</li>
                ))}
            </ul>
        </div>
    </div>

</section>
);};

export default Vision
