<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('esim_package_code')->nullable()->after('item_id');
            $table->text('esim_data')->nullable()->after('midtrans_response');
            $table->string('esim_iccid')->nullable()->after('esim_data');
            $table->string('esim_transaction_no')->nullable()->after('esim_iccid');
            $table->enum('order_status', ['pending', 'processing', 'completed', 'failed'])
                ->default('pending')->after('status');
        });
    }

    public function down()
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'esim_package_code', 
                'esim_data', 
                'esim_iccid', 
                'esim_transaction_no',
                'order_status'
            ]);
        });
    }
};