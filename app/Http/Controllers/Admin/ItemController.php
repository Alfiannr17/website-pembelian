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

class ItemController extends Controller
{
     public function index(Request $request)
    {
        $query = Item::with('game');

        if ($request->game_id) {
            $query->where('game_id', $request->game_id);
        }

        $items = $query->latest()->paginate(10);
        $games = Game::where('is_active', true)->get();

        return Inertia::render('Admin/Items/Index', [
            'items' => $items,
            'games' => $games,
            'filters' => $request->only('game_id')
        ]);
    }

    public function create()
    {
        $games = Game::where('is_active', true)->get();
        return Inertia::render('Admin/Items/Create', ['games' => $games]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        Item::create($validated);

        return redirect()->route('admin.items.index')
            ->with('success', 'Item berhasil ditambahkan');
    }

    public function edit(Item $item)
    {
        $games = Game::where('is_active', true)->get();
        return Inertia::render('Admin/Items/Edit', [
            'item' => $item,
            'games' => $games
        ]);
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'game_id' => 'required|exists:games,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $item->update($validated);

        return redirect()->route('admin.items.index')
            ->with('success', 'Item berhasil diupdate');
    }

    public function destroy(Item $item)
    {
        $item->delete();
        return redirect()->route('admin.items.index')
            ->with('success', 'Item berhasil dihapus');
    }

    public function toggleStatus(Item $item)
    {
        $item->update(['is_active' => !$item->is_active]);
        
        return back()->with('success', 'Status item berhasil diubah');
    }
}
