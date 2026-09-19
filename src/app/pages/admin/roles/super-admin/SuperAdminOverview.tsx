import React from "react";
import {
  Activity, Server, Database, Cpu, Users, Shield,
  CheckCircle2, AlertTriangle, RefreshCw, ArrowUpRight, Zap
} from "lucide-react";

export function SuperAdminOverview() {
  const microservices = [
    { name: "Auth & Firebase Identity", status: "Healthy", uptime: "99.99%", latency: "14ms", load: "24%", reqSec: "2,400" },
    { name: "Home Feed Recommendation Engine", status: "Healthy", uptime: "99.95%", latency: "42ms", load: "61%", reqSec: "8,120" },
    { name: "BariKoi Geo Reverse Geocoding Hub", status: "Circuit Protected", uptime: "99.98%", latency: "28ms", load: "32%", reqSec: "1,250" },
    { name: "OpenRouter & DeepSeek AI Agent", status: "Healthy", uptime: "99.90%", latency: "140ms", load: "58%", reqSec: "890" },
    { name: "Media CDN (Photos/Videos)", status: "Healthy", uptime: "99.99%", latency: "19ms", load: "45%", reqSec: "3,400" },
    { name: "Emergency Push Broadcast Pipeline", status: "Healthy", uptime: "100.0%", latency: "8ms", load: "12%", reqSec: "410" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase text-red-600 font-bold tracking-wider">Super Admin Exclusive</span>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
            System Infrastructure & API Health
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring of application microservices, database clusters, and third-party API quotas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
          </button>
        </div>
      </div>

      {/* Global Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total API Requests</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">14,280 RPM</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">99.98% HTTP 200 OK</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Global p95 Latency</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">38 ms</div>
          <div className="text-[11px] text-slate-500 mt-1">-4 ms compared to yesterday</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">BariKoi API Rate Limit</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">Active Cache</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Circuit breaker active (0% 429s)</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Database Load</span>
            <Database className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">31.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">Cluster status: Healthy</div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-[#C04A22]" /> Production Microservices Status
          </h2>
          <span className="text-[11px] text-emerald-700 font-mono font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All Systems Operational
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4">Health Status</th>
                <th className="py-3 px-4">30-Day Uptime</th>
                <th className="py-3 px-4">Avg Latency</th>
                <th className="py-3 px-4">Node Load</th>
                <th className="py-3 px-4 text-right">Throughput</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {microservices.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{s.name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{s.uptime}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{s.latency}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: s.load }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{s.load}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500">{s.reqSec} req/s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
