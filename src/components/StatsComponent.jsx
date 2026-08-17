import { Zap, Users, GraduationCap } from 'lucide-react';

const StatsComponent = () => {

const stats = [
    { label: 'Students', value: '10k', icon: <Users size={40} /> },
    { label: 'Courses', value: '40', icon: <Zap size={40} /> },
    { label: 'Teachers', value: '40', icon: <GraduationCap size={40} /> },
  ];

return (
      <div className="relative py-6 bg-black/80 z-30">
          <div className="flex justify-around md:gap-15 max-w-7xl mx-auto px-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="flex flex-col justify-center items-center gap-2 mb-1 text-tertiary">
                  {stat.icon} <p className="text-text-secondary text-sm uppercase tracking-widest font-bold">{stat.label}</p>
                </div>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>    
      </div>
)};

export default StatsComponent