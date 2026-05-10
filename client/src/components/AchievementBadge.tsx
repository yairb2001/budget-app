import { motion } from 'framer-motion';

interface Props {
  icon: string;
  name: string;
  description: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  small?: boolean;
}

export default function AchievementBadge({ icon, name, description, color, unlocked, unlockedAt, small }: Props) {
  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.05 } : {}}
      className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all ${
        unlocked ? 'shadow-md' : 'opacity-40 grayscale'
      }`}
      style={{ background: unlocked ? `${color}15` : '#f5f5f5' }}
    >
      <div
        className={`${small ? 'w-12 h-12 text-2xl' : 'w-16 h-16 text-3xl'} rounded-full flex items-center justify-center mb-2 shadow-inner`}
        style={{ background: unlocked ? `${color}25` : '#e0e0e0' }}
      >
        {icon}
      </div>
      <p className={`font-bold text-gray-800 ${small ? 'text-xs' : 'text-sm'} leading-tight`}>{name}</p>
      {!small && (
        <p className="text-xs text-gray-500 mt-1 leading-tight">{description}</p>
      )}
      {unlocked && unlockedAt && !small && (
        <p className="text-[10px] text-gray-400 mt-1">
          {new Date(unlockedAt).toLocaleDateString('he-IL')}
        </p>
      )}
    </motion.div>
  );
}
