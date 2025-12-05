<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\Game;
use App\Models\Item;
use App\Models\Transaction;
use App\Models\User;

class DashboardController extends Controller
{
     public function index()
    {
        $stats = [
            'total_games' => Game::count(),
            'total_items' => Item::count(),
            'total_transactions' => Transaction::count(),
            'total_revenue' => Transaction::where('status', 'paid')->sum('amount'),
            'pending_transactions' => Transaction::where('status', 'pending')->count(),
        ];

        $recent_transactions = Transaction::with(['game', 'item', 'user'])
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recent_transactions' => $recent_transactions,
        ]);
    }
}
