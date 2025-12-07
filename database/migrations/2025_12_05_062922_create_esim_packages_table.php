<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Hanya tabel orders, paket langsung dari API
        Schema::create('esim_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('transaction_id')->nullable()->constrained()->onDelete('set null');
            
            // Package info from API (snapshot saat order)
            $table->string('package_code'); // Kode paket dari API
            $table->string('package_name'); 
            $table->string('data_amount'); // "1GB", "5GB"
            $table->integer('validity_days');
            $table->string('operator')->nullable();
            
            // Customer info
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone')->nullable();
            
            // Payment
            $table->decimal('amount', 10, 2);
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'expired'])->default('pending');
            $table->enum('order_status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            
            // eSIM Data from API Provider
            $table->string('iccid')->nullable(); // SIM card number
            $table->string('activation_code')->nullable(); // QR code data
            $table->text('qr_code_url')->nullable(); // URL to QR code image
            $table->json('esim_data')->nullable(); // Full response from API
            $table->string('api_transaction_id')->nullable(); // Transaction ID dari API provider
            
            // Usage tracking
            $table->decimal('data_used_mb', 10, 2)->default(0);
            $table->decimal('data_total_mb', 10, 2)->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('customer_email');
            $table->index(['payment_status', 'order_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('esim_orders');
    }
};