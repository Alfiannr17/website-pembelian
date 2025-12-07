<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('esim_packages', function (Blueprint $table) {
            $table->id();
            $table->string('package_code')->unique();
            $table->string('slug')->unique();
            $table->string('location_code');
            $table->string('location_name');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->bigInteger('data_volume'); 
            $table->integer('duration'); 
            $table->string('duration_unit')->default('DAY');
            $table->integer('data_type'); 
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('location_code');
            $table->index('is_active');
        });
    }

    public function down()
    {
        Schema::dropIfExists('esim_packages');
    }
};