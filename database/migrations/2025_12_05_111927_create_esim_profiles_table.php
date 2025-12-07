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
            
            $table->string('esim_tran_no')->unique();
            $table->string('iccid')->nullable();
            $table->string('imsi')->nullable();
            $table->string('msisdn')->nullable();
   
            $table->text('activation_code'); 
            $table->string('qr_code_url')->nullable();
            $table->integer('active_type')->default(1); 

            $table->string('smdp_status')->default('RELEASED'); 
            $table->string('esim_status')->default('GOT_RESOURCE');
            $table->string('eid')->nullable();

            $table->bigInteger('total_volume'); 
            $table->bigInteger('order_usage')->default(0); 
            $table->integer('total_duration');
            $table->string('duration_unit')->default('DAY');

            $table->string('pin')->nullable();
            $table->string('puk')->nullable();
            $table->string('apn')->nullable();
            $table->integer('sms_status')->default(0);
            $table->integer('data_type')->default(1);
            
            $table->timestamp('expired_time')->nullable();
            $table->timestamp('last_usage_check')->nullable();
            
            $table->json('raw_data')->nullable(); 
            
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