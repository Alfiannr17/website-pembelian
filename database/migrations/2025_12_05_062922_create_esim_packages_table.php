<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('esim_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('set null');
            
            $table->string('package_code'); 
            $table->string('package_name'); 
            $table->string('data_amount'); 
            $table->integer('validity_days');
            $table->string('operator')->nullable();
            
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            
            $table->decimal('amount', 10, 2);
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'expired'])->default('pending');
            $table->enum('order_status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            
            $table->string('iccid')->nullable(); 
            $table->string('activation_code')->nullable(); 
            $table->text('qr_code_url')->nullable(); 
            $table->json('esim_data')->nullable(); 
            $table->string('api_transaction_id')->nullable(); 
            
            $table->decimal('data_used_mb', 10, 2)->default(0);
            $table->decimal('data_total_mb', 10, 2)->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            
            $table->timestamps();
            
            $table->index('customer_email');
            $table->index(['payment_status', 'order_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('esim_orders');
    }
};