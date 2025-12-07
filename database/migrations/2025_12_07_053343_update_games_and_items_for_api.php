<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Tambah kolom di tabel GAMES
        Schema::table('games', function (Blueprint $table) {
            if (!Schema::hasColumn('games', 'api_brand')) {
                $table->string('api_brand')->nullable()->after('slug'); // Kode Brand API (misal: Mobile Legends)
            }
            if (!Schema::hasColumn('games', 'provider')) {
                $table->string('provider')->default('manual')->after('api_brand'); // 'manual' atau 'vip'
            }
            if (!Schema::hasColumn('games', 'is_zone_id_required')) {
                $table->boolean('is_zone_id_required')->default(false)->after('provider');
            }
        });

        // 2. Tambah kolom di tabel ITEMS
        Schema::table('items', function (Blueprint $table) {
            if (!Schema::hasColumn('items', 'api_code')) {
                $table->string('api_code')->nullable()->after('id'); // Kode Layanan API (misal: ML5)
            }
        });

        // 3. Tambah kolom di tabel TRANSACTIONS
        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'game_user_id')) {
                $table->string('game_user_id')->nullable()->after('item_id'); // ID Player
            }
            if (!Schema::hasColumn('transactions', 'game_zone_id')) {
                $table->string('game_zone_id')->nullable()->after('game_user_id'); // Zone ID
            }
            if (!Schema::hasColumn('transactions', 'api_trx_id')) {
                $table->string('api_trx_id')->nullable(); // ID Transaksi dari Provider
            }
            if (!Schema::hasColumn('transactions', 'api_note')) {
                $table->text('api_note')->nullable(); // Catatan/SN dari Provider
            }
        });
    }

    public function down()
    {
        // Drop columns jika rollback (opsional)
    }
};