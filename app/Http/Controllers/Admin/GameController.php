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
use App\Services\VipResellerService;


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
        $hasTransactions = Transaction::whereIn('item_id', $game->items->pluck('id'))->exists();

        if ($hasTransactions) {
            return back()->with('error', 'Gagal menghapus! Game ini memiliki riwayat transaksi. Silakan ubah status menjadi Inactive saja.');
        }

        $game->delete();
        
        return redirect()->route('admin.games.index')
            ->with('success', 'Game berhasil dihapus');
    }

  


     */
    public function showSyncPage(VipResellerService $vip)
    {
        $result = $vip->getServices();

        if (!($result['result'] ?? false)) {
            return back()->with('error', 'Gagal koneksi ke API VIP.');
        }
        $groupedGames = [];
        
        foreach ($result['data'] as $service) {
            $gameName = $service['game'];
            
            if (!isset($groupedGames[$gameName])) {
                $groupedGames[$gameName] = [
                    'brand' => $gameName,
                    'category' => $service['category'] ?? 'Game',
                    'total_items' => 0,
                ];
            }
            $groupedGames[$gameName]['total_items']++;
        }

        ksort($groupedGames); 

        return Inertia::render('Admin/Games/Sync', [
            'apiGames' => array_values($groupedGames)
        ]);
    }

    /**
     * PROSES SIMPAN GAME TERPILIH (POST)
     */
    public function processSync(Request $request, VipResellerService $vip)
    {
        $request->validate([
            'selected_brands' => 'required|array',
            'profit_margin' => 'numeric|min:0'
        ]);

        $selectedBrands = $request->selected_brands;
        $marginPercent = $request->profit_margin ?? 5;

        $result = $vip->getServices();
        
        if (!($result['result'] ?? false)) return back();

        $countGame = 0;
        $countItem = 0;

        foreach ($result['data'] as $service) {
            if (in_array($service['game'], $selectedBrands)) {
                
                // 1. Simpan Game
                $game = Game::firstOrCreate(
                    ['api_brand' => $service['game']], 
                    [
                        'name' => $service['game'],
                        'slug' => Str::slug($service['game']),
                        'provider' => 'vip',
                        'is_zone_id_required' => str_contains(strtolower($service['game']), 'mobile legends'),
                        'image' => null,
                        'is_active' => true
                    ]
                );
                if ($game->wasRecentlyCreated) $countGame++;

                $modal = $service['price']['special'] ?? 0;
                $jual = $modal + ($modal * ($marginPercent / 100));

                Item::updateOrCreate(
                    ['api_code' => $service['code']],
                    [
                        'game_id' => $game->id,
                        'name' => $service['name'],
                        'price' => ceil($jual),
                        'is_active' => ($service['status'] === 'available')
                    ]
                );
                $countItem++;
            }
        }

        return redirect()->route('admin.games.index')
            ->with('success', "Sukses! $countGame game baru & $countItem layanan ditambahkan.");
    }


}
