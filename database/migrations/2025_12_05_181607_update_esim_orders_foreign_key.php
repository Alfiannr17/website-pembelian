<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('esim_orders', function (Blueprint $table) {
            // 1. Hapus Foreign Key Constraint yang lama (esim_package_id)
            // Format default Laravel: table_column_foreign
            $table->dropForeign(['esim_package_id']); 
            
            // 2. Hapus kolom esim_package_id
            $table->dropColumn('esim_package_id');

            // 3. Jadikan esim_package_code sebagai Foreign Key baru
            // Pastikan kolom 'package_code' di tabel 'esim_packages' bersifat UNIQUE (sudah unique di file Anda)
            $table->foreign('esim_package_code')
                  ->references('package_code')
                  ->on('esim_packages')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('esim_orders', function (Blueprint $table) {
            // 1. Hapus Foreign Key code jika rollback
            $table->dropForeign(['esim_package_code']);

            // 2. Buat ulang kolom id
            $table->foreignId('esim_package_id')->nullable()->constrained()->onDelete('cascade');
        });
    }
};