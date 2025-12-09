<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('games', function (Blueprint $table) {
            if (!Schema::hasColumn('games', 'api_brand')) {
                $table->string('api_brand')->nullable()->after('slug'); 
            }
            if (!Schema::hasColumn('games', 'provider')) {
                $table->string('provider')->default('manual')->after('api_brand'); 
            }
            if (!Schema::hasColumn('games', 'is_zone_id_required')) {
                $table->boolean('is_zone_id_required')->default(false)->after('provider');
            }
        });

        Schema::table('items', function (Blueprint $table) {
            if (!Schema::hasColumn('items', 'api_code')) {
                $table->string('api_code')->nullable()->after('id'); 
            }
        });

        Schema::table('transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('transactions', 'game_user_id')) {
                $table->string('game_user_id')->nullable()->after('item_id'); 
            }
            if (!Schema::hasColumn('transactions', 'game_zone_id')) {
                $table->string('game_zone_id')->nullable()->after('game_user_id'); 
            }
            if (!Schema::hasColumn('transactions', 'api_trx_id')) {
                $table->string('api_trx_id')->nullable(); 
            }
            if (!Schema::hasColumn('transactions', 'api_note')) {
                $table->text('api_note')->nullable(); 
            }
        });
    }

    public function down()
    {
     
    }
};