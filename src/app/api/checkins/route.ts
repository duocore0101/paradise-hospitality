import { NextResponse } from 'next/server';
import { getCheckins, saveCheckin, updateCheckin } from '@/lib/storage';
import { GuestRegistration } from '@/types/checkin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const checkins = getCheckins();

    // Calculate next suggested serial number based on latest record
    let nextSrNo = '001';
    if (checkins && checkins.length > 0) {
      const numbers = checkins
        .map((c) => parseInt(String(c.srNo || '').replace(/\D/g, ''), 10))
        .filter((n) => !isNaN(n));
      if (numbers.length > 0) {
        const maxNum = Math.max(...numbers);
        nextSrNo = String(maxNum + 1).padStart(3, '0');
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: checkins,
        nextSrNo,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('[GET /api/checkins error]:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (parseError: any) {
      console.error('[POST /api/checkins JSON parse error]:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request format.' },
        { status: 400 }
      );
    }

    if (!body || !body.name || !body.mobile || !body.roomNo) {
      return NextResponse.json(
        { success: false, message: 'Name, Mobile, and Room Number are required.' },
        { status: 400 }
      );
    }

    const newRecord: GuestRegistration = {
      id: body.id || 'chk-' + Date.now(),
      srNo: body.srNo || '001',
      hotelId: body.hotelId || 'treebo-jp-cottage',
      hotelName: body.hotelName || 'Treebo Jp Cottage',
      date: body.date || new Date().toISOString().split('T')[0],
      leadSource: body.leadSource || 'Walk-in Direct',
      name: String(body.name).trim(),
      address: body.address || '',
      mobile: String(body.mobile).trim(),
      checkInDate: body.checkInDate || new Date().toISOString().split('T')[0],
      checkInTime: body.checkInTime || '12:00 PM',
      checkOutDate: body.checkOutDate || '',
      checkOutTime: body.checkOutTime || '11:00 AM',
      adults: body.adults !== undefined ? body.adults : 1,
      children: body.children !== undefined ? body.children : 0,
      nightsStay: body.nightsStay !== undefined ? body.nightsStay : 1,
      vehicleNo: body.vehicleNo || '',
      nationality: body.nationality || 'Indian',
      email: body.email || '',
      idProofType: body.idProofType || 'Aadhaar Card',
      idProofNumber: body.idProofNumber || '',
      idProofFile: body.idProofFile || '',
      idProofFileName: body.idProofFileName || '',
      roomNo: String(body.roomNo).trim(),
      roomRate: body.roomRate ? Number(body.roomRate) : undefined,
      advanceAmount: body.advanceAmount !== undefined ? body.advanceAmount : 0,
      receiptNo: body.receiptNo || '',
      checkoutAgreement: Boolean(body.checkoutAgreement),
      billingItems: Array.isArray(body.billingItems) ? body.billingItems : [],
      discountAmount: body.discountAmount !== undefined ? Number(body.discountAmount) : 0,
      taxRate: body.taxRate !== undefined ? Number(body.taxRate) : 12,
      paymentMethod: body.paymentMethod || 'UPI / QR Code',
      paymentStatus: body.paymentStatus || 'Partially Paid',
      invoiceNumber: body.invoiceNumber || `INV-${body.srNo || '001'}`,
      signature: body.signature || '',
      signedAt: body.signature ? new Date().toISOString() : '',
      status: 'Checked In',
      createdAt: new Date().toISOString(),
    };

    const updatedList = saveCheckin(newRecord);

    return NextResponse.json({
      success: true,
      message: 'Guest checked in successfully!',
      record: newRecord,
      total: updatedList.length,
    });
  } catch (error: any) {
    console.error('[POST /api/checkins execution error]:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to process check-in.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (parseError: any) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request format.' },
        { status: 400 }
      );
    }

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Guest ID is required.' },
        { status: 400 }
      );
    }

    const updatedList = updateCheckin(id, updates);

    return NextResponse.json({
      success: true,
      message: 'Guest record updated successfully',
      data: updatedList,
    });
  } catch (error: any) {
    console.error('[PATCH /api/checkins execution error]:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update guest record.' },
      { status: 500 }
    );
  }
}
