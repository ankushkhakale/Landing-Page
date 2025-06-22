"use client"

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Rocket } from 'lucide-react';

export const AnimatedCompetitionButton = () => {
    const { user } = useAuth();
    const router = useRouter();

    const handleClick = () => {
        if (user) {
            router.push("/dashboard");
        } else {
            router.push("/signup");
        }
    };

    return (
        <motion.button
            onClick={handleClick}
            className="relative w-fit px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full z-10 flex items-center justify-center gap-3 text-white text-lg font-semibold transition-all duration-300 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ 
                scale: 0.95,
                backgroundColor: "rgb(174, 0, 255)",
                boxShadow: "0px 0px 40px rgba(174, 0, 255, 0.438)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            Join the Competition
            <Rocket className="w-6 h-6" />
        </motion.button>
    );
}; 