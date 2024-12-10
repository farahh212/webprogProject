<?php

use App\Http\Controllers\UserrController;
use App\Models\Userr;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/users/get',[UserrController::class,'index']);
Route::get('/users/showbyId/{id}',[UserrController::class,'show']);
Route::post('/users/post',[UserrController::class,'store']);
Route::put('/users/update/{id}',[UserrController::class,'update']);
Route::delete('/users/delete/{id}',[UserrController::class,'destroy']);


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
