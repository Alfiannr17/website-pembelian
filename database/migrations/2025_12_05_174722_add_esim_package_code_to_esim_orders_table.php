<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('esim_orders', function (Blueprint $table) {
        $table->string('esim_package_code')->after('user_id');
    });
}

public function down()
{
    Schema::table('esim_orders', function (Blueprint $table) {
        $table->dropColumn('esim_package_code');
    });
}

};
