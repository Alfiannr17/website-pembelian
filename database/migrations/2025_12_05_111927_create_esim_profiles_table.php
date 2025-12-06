<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('esim_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('esim_order_id')->constrained()->onDelete('cascade');
            
            // eSIM Profile Details from API
            $table->string('esim_tran_no')->unique();
            $table->string('iccid')->nullable();
            $table->string('imsi')->nullable();
            $table->string('msisdn')->nullable();
            
            // Activation
            $table->text('activation_code'); // LPA string
            $table->string('qr_code_url')->nullable();
            $table->integer('active_type')->default(1); // 1=First install, 2=First connection
            
            // Status
            $table->string('smdp_status')->default('RELEASED'); // RELEASED, ENABLED, etc
            $table->string('esim_status')->default('GOT_RESOURCE');
            $table->string('eid')->nullable();
            
            // Data Usage
            $table->bigInteger('total_volume'); // in bytes
            $table->bigInteger('order_usage')->default(0); // in bytes
            $table->integer('total_duration');
            $table->string('duration_unit')->default('DAY');
            
            // Additional Info
            $table->string('pin')->nullable();
            $table->string('puk')->nullable();
            $table->string('apn')->nullable();
            $table->integer('sms_status')->default(0);
            $table->integer('data_type')->default(1);
            
            // Timestamps
            $table->timestamp('expired_time')->nullable();
            $table->timestamp('last_usage_check')->nullable();
            
            $table->json('raw_data')->nullable(); // Full API response
            
            $table->timestamps();
            
            $table->index('esim_status');
            $table->index('smdp_status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('esim_profiles');
    }
};