import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NavBar } from '../NavBar';
import { ConnectionStatus } from '../ConnectionStatus';

export const ProtectedLayout: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) return null;

    return (
        <div className="relative min-h-screen bg-[#1a1a1a] flex flex-col">
            <NavBar />
            <div className="flex-1">
                <Outlet />
            </div>
            <ConnectionStatus />
        </div>
    );
};
