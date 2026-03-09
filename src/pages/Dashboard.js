import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { 
    Navigation, LogOut, Search, RefreshCcw, 
    MessageCircle, MapPin, Clock, Calendar, 
    CheckCircle, XCircle, Send, Loader2, Car, Phone, 
    ShieldCheck, Zap, ArrowRight, User
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = ({ session }) => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [timeFilter, setTimeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchRides();
        const subscription = supabase.channel('command_center')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => fetchRides())
            .subscribe();
        return () => supabase.removeChannel(subscription);
    }, []);

    const fetchRides = async () => {
        const { data, error } = await supabase.from("rides").select("*").order("created_at", { ascending: false });
        if (!error) setRides(data);
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        await supabase.from('rides').update({ status }).eq('id', id);
        fetchRides();
    };

    const sendWhatsApp = (num, name, type) => {
        const cleanNum = num.replace(/\D/g, '');
        const msg = type === 'alt' ? `Emergency contact for ${name}.` : `Hi ${name}, PAHEL support here. Your ride is being updated.`;
        window.open(`https://wa.me/91${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // --- SMART LOGIC ENGINE ---
    const stats = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const todayRides = rides.filter(r => r.ride_date === todayStr);
        return {
            total: rides.length,
            pending: rides.filter(r => r.status === 'pending').length,
            todayActive: todayRides.length,
            completedToday: todayRides.filter(r => r.status === 'completed').length
        };
    }, [rides]);

    const filteredData = useMemo(() => {
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA');

        return rides.filter(r => {
            // Time Logic
            let timeMatch = true;
            const rDate = new Date(r.ride_date);
            if (timeFilter === 'today') timeMatch = r.ride_date === todayStr;
            else if (timeFilter === 'weekly') {
                const diff = (now - rDate) / (1000 * 60 * 60 * 24);
                timeMatch = diff <= 7;
            } else if (timeFilter === 'monthly') {
                timeMatch = rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear();
            }

            // Global Search Logic (Multi-field)
            const s = search.toLowerCase();
            const searchMatch = 
                r.passenger_name?.toLowerCase().includes(s) || 
                r.phone_number?.includes(s) || 
                r.vehicle_class?.toLowerCase().includes(s) ||
                r.pickup_location?.toLowerCase().includes(s);

            const statusMatch = statusFilter === 'all' || r.status === statusFilter;

            return timeMatch && searchMatch && statusMatch;
        });
    }, [rides, search, timeFilter, statusFilter]);

    if (loading) return (
        <div className="loader-container">
            <Loader2 className="spinning" size={48} color="var(--primary)" />
        </div>
    );

    return (
        <div className="app-container">
            {/* Top Navigation Bar */}
            <header className="dash-header">
                <div>
                    <h1>PAHEL Shedule Ride Panel</h1>
                    <p>System Online • {filteredData.length} records matching your filters</p>
                </div>
                <div style={{display: 'flex', gap: '12px'}}>
                    <button className="btn-icon" onClick={fetchRides} title="Sync Data"><RefreshCcw size={20}/></button>
                    <button className="btn-icon" style={{background: 'var(--danger)', color: '#fff', border:'none'}} onClick={() => supabase.auth.signOut()} title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Analytics Dashboard */}
            <div className="stats-container">
                <div className="glass-card">
                    <span className="stat-label">Total Volume</span>
                    <span className="stat-value">{stats.total}</span>
                    <Zap className="stat-icon" />
                </div>
                <div className="glass-card" style={{borderLeft: '5px solid var(--warning)'}}>
                    <span className="stat-label">Pending Rides</span>
                    <span className="stat-value" style={{color: 'var(--warning)'}}>{stats.pending}</span>
                    <Clock className="stat-icon" />
                </div>
                <div className="glass-card" style={{borderLeft: '5px solid var(--primary)'}}>
                    <span className="stat-label">Scheduled Today</span>
                    <span className="stat-value" style={{color: 'var(--primary)'}}>{stats.todayActive}</span>
                    <Calendar className="stat-icon" />
                </div>
                <div className="glass-card" style={{borderLeft: '5px solid var(--success)'}}>
                    <span className="stat-label">Successful Rides</span>
                    <span className="stat-value" style={{color: 'var(--success)'}}>{stats.completedToday}</span>
                    <ShieldCheck className="stat-icon" />
                </div>
            </div>

            {/* Intelligent Filter Bar */}
            <div className="filter-engine">
                <div className="search-wrapper">
                    <Search size={18} style={{position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)'}} />
                    <input 
                        placeholder="Search by passenger name, phone, car type or location..." 
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{display:'flex', gap: '12px', alignItems:'center'}}>
                    <div className="filter-tabs">
                        {['all', 'today', 'weekly', 'monthly'].map(t => (
                            <button 
                                key={t} 
                                onClick={() => setTimeFilter(t)} 
                                className={`tab ${timeFilter === t ? 'active' : ''}`}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <select className="search-wrapper" style={{width: '160px', padding: '12px', borderRadius: '12px'}} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Status: All</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Data Command Center */}
            <div className="table-wrapper">
                <table className="pahel-table">
                    <thead>
                        <tr>
                            <th>Passenger & Vehicle</th>
                            <th>Contact Hub</th>
                            <th>Route Mapping</th>
                            <th>Schedule</th>
                            <th>Current Status</th>
                            <th style={{textAlign:'right'}}>Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(ride => (
                            <tr key={ride.id}>
                                <td>
                                    <div style={{fontWeight: 800, fontSize: '15px', display:'flex', alignItems:'center', gap: '8px'}}>
                                        <User size={16} color="var(--primary)"/> {ride.passenger_name}
                                    </div>
                                    <div style={{marginTop: '8px'}}>
                                        <span className="vehicle-badge"><Car size={14}/> {ride.vehicle_class || 'Standard'}</span>
                                    </div>
                                </td>
                                <td>
                                    <a onClick={() => sendWhatsApp(ride.phone_number, ride.passenger_name, 'main')} className="contact-btn wa-main" style={{cursor:'pointer'}}>
                                        <MessageCircle size={14}/> Primary: {ride.phone_number}
                                    </a>
                                    {ride.alt_phone && (
                                        <div style={{marginTop: '8px'}}>
                                            <a onClick={() => sendWhatsApp(ride.alt_phone, ride.passenger_name, 'alt')} className="contact-btn wa-alt" style={{cursor:'pointer'}}>
                                                <Phone size={14}/> Alternate: {ride.alt_phone}
                                            </a>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <div style={{display:'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--success)', fontWeight: 700}}>
                                        <div style={{width:8, height:8, borderRadius:'50%', background:'var(--success)'}}></div>
                                        {ride.pickup_location}
                                    </div>
                                    <ArrowRight size={12} style={{margin: '4px 0 4px 18px', color: 'var(--text-muted)'}} />
                                    <div style={{display:'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--danger)', fontWeight: 700}}>
                                        <div style={{width:8, height:8, borderRadius:'50%', background:'var(--danger)'}}></div>
                                        {ride.drop_location}
                                    </div>
                                </td>
                                <td>
                                    <div style={{fontWeight: 700, fontSize: '14px'}}>{ride.ride_date}</div>
                                    <div style={{color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px'}}>{ride.ride_time}</div>
                                </td>
                                <td>
                                    <span className={`status-pill ${ride.status}`}>{ride.status}</span>
                                </td>
                                <td>
                                    <div className="action-btn-group" style={{textAlign: 'right'}}>
                                        <div style={{fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase'}}>
                                            {}
                                        </div>
                                        <div style={{display:'flex', gap: '8px', justifyContent: 'flex-end'}}>
                                            <button className="btn-icon" title="Confirm Ride" onClick={() => updateStatus(ride.id, 'confirmed')}><Send size={18} color="var(--primary)"/></button>
                                            <button className="btn-icon" title="Mark Completed" onClick={() => updateStatus(ride.id, 'completed')}><CheckCircle size={18} color="var(--success)"/></button>
                                            <button className="btn-icon" title="Cancel Ride" onClick={() => updateStatus(ride.id, 'cancelled')}><XCircle size={18} color="var(--danger)"/></button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div style={{padding: '60px', textAlign: 'center'}}>
                        <Loader2 size={32} color="var(--border)" />
                        <p style={{color: 'var(--text-muted)', marginTop: '12px'}}>No operational data found for this period.</p>
                    </div>
                )}
            </div>
            <style>{`.spinning { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } } .loader-container { display: flex; height: 100vh; justify-content: center; alignItems: center; background: #f8fafc; }`}</style>
        </div>
    );
};

export default Dashboard;