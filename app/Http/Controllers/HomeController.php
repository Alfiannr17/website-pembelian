<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Game;
use Inertia\Inertia;


class HomeController extends Controller
{
    public function index()
    {
        $featured_games = Game::where('is_active', true)
            ->withCount('items')
            ->take(6)
            ->get();

        $all_games = Game::where('is_active', true)
            ->withCount('items')
            ->get();

        return Inertia::render('Home', [
            'featured_games' => $featured_games,
            'all_games' => $all_games,
        ]);
    }
}
