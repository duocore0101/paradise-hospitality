import { NextResponse } from 'next/server';
import { getCheckins, saveCheckin, updateCheckin } from '@/lib/storage';
import { GuestRegistration } from '@/types/checkin';

export async function GET() {
  try {
    const checkins = getCheckins();
    
    // Calculate next suggested serial number based on latest record
    let nextSrNo = '001';
    if (checkins.length > 0) {
      const numbers = checkins
        .map((c) => parseInt(c.srNo.replace(/\D/g, ''), 10))
        .filter((n) => !isNaN(n));
      if (numbers.length > 0) {
        const maxNum = Math.max(...numbers);
        nextSrNo = String(maxNum + 1).padStart(3, '0');
      }
    }

    return NextResponse.json({
      success: true,
      data: checkins,
      nextSrNo,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.mobile || !body.roomNo) {
      return NextResponse.json(
        { success: false, message: 'Name, Mobile, and Room Number are required.' },
        { status: 400 }
      );
    }

    const newRecord: GuestRegistration = {
      id: 'chk-' + Date.now(),
      srNo: body.srNo || '001',
      hotelId: body.hotelId || 'treebo-jp-cottage',
      hotelName: body.hotelName || 'Treebo Jp Cottage',
      date: body.date || new Date().toISOString().split('T')[0],
      leadSource: body.leadSource || 'Walk-in Direct',
      name: body.name.trim(),
      address: body.address || '',
      mobile: body.mobile.trim(),
      checkInDate: body.checkInDate || new Date().toISOString().split('T')[0],
      checkInTime: body.checkInTime || '',
      checkOutDate: body.checkOutDate || '',
      checkOutTime: body.checkOutTime || '11:00 AM',
      adults: body.adults || 1,
      children: body.children || 0,
      nightsStay: body.nightsStay || 1,
      vehicleNo: body.vehicleNo || '',
      nationality: body.nationality || 'Indian',
      email: body.email || '',
      idProofType: body.idProofType || 'Aadhaar Card',
      idProofNumber: body.idProofNumber || '',
      idProofFile: body.idProofFile || '',
      idProofFileName: body.idProofFileName || '',
      roomNo: body.roomNo.trim(),
      advanceAmount: body.advanceAmount || 0,
      receiptNo: body.receiptNo || '',
      checkoutAgreement: Boolean(body.checkoutAgreement),
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
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to process check-in.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
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
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update guest record.' },
      { status: 500 }
    );
  }
}

