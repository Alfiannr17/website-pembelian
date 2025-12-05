<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

use App\Models\Game;
use App\Models\Item;
use App\Models\Transaction;
use App\Models\User; 

class GameController extends Controller
{
     public function index()
    {
        $games = Game::withCount('items')->latest()->paginate(10);
        return Inertia::render('Admin/Games/Index', ['games' => $games]);
    }

    public function create()
    {
        return Inertia::render('Admin/Games/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('games', 'public');
        }

        Game::create($validated);

        return redirect()->route('admin.games.index')
            ->with('success', 'Game berhasil ditambahkan');
    }

    public function edit(Game $game)
    {
        return Inertia::render('Admin/Games/Edit', ['game' => $game]);
    }

    public function update(Request $request, Game $game)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('games', 'public');
        }

        $game->update($validated);

        return redirect()->route('admin.games.index')
            ->with('success', 'Game berhasil diupdate');
    }

    public function destroy(Game $game)
    {
        $game->delete();
        return redirect()->route('admin.games.index')
            ->with('success', 'Game berhasil dihapus');
    }
}
