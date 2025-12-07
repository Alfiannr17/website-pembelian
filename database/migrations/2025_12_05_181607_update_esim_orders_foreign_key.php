<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('esim_orders', function (Blueprint $table) {
      
            $table->dropForeign(['esim_package_id']); 
            
            $table->dropColumn('esim_package_id');

            $table->foreign('esim_package_code')
                  ->references('package_code')
                  ->on('esim_packages')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('esim_orders', function (Blueprint $table) {
            $table->dropForeign(['esim_package_code']);

            $table->foreignId('esim_package_id')->nullable()->constrained()->onDelete('cascade');
        });
    }
};