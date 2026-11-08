// QA-only ZIP reader for the delivered artifacts, using Node built-ins.
// Use central-directory lengths so both stored and deflated releases are read.
import assert from 'node:assert/strict';
import {inflateRawSync} from 'node:zlib';

export function readZipEntries(zip){
  let end=zip.length-22;
  while(end>=Math.max(0,zip.length-65557)){
    if(zip.readUInt32LE(end)===0x06054b50 && end+22+zip.readUInt16LE(end+20)===zip.length)break;
    end--;
  }
  assert.ok(end>=Math.max(0,zip.length-65557),'ZIP end record');
  assert.equal(zip.readUInt16LE(end+4),0,'single disk');
  assert.equal(zip.readUInt16LE(end+6),0,'single disk directory');
  const count=zip.readUInt16LE(end+10);
  assert.equal(zip.readUInt16LE(end+8),count);
  assert.ok(count>0 && count<=32,'bounded product file count');
  const directory=zip.readUInt32LE(end+16);
  assert.equal(directory+zip.readUInt32LE(end+12),end,'complete directory');
  const entries=new Map();let cursor=directory;
  for(let i=0;i<count;i++){
    assert.equal(zip.readUInt32LE(cursor),0x02014b50,'central entry');
    const flags=zip.readUInt16LE(cursor+8),method=zip.readUInt16LE(cursor+10);
    assert.equal(flags&1,0,'no encrypted customer files');
    assert.ok(method===0 || method===8,'stored or deflated');
    const crc=zip.readUInt32LE(cursor+16),packed=zip.readUInt32LE(cursor+20),size=zip.readUInt32LE(cursor+24);
    const nameLength=zip.readUInt16LE(cursor+28),extra=zip.readUInt16LE(cursor+30),comment=zip.readUInt16LE(cursor+32);
    const name=zip.subarray(cursor+46,cursor+46+nameLength).toString('utf8');
    assert.ok(name && !/^(?:\/|[A-Za-z]:)|\\|(?:^|\/)\.\.(?:\/|$)/.test(name),'safe relative ZIP name');
    assert.ok(!entries.has(name),'unique ZIP filename');
    const local=zip.readUInt32LE(cursor+42);
    assert.equal(zip.readUInt32LE(local),0x04034b50,'local entry');
    assert.equal(zip.readUInt16LE(local+8),method);
    const localName=zip.readUInt16LE(local+26),localExtra=zip.readUInt16LE(local+28);
    assert.equal(zip.subarray(local+30,local+30+localName).toString('utf8'),name);
    const start=local+30+localName+localExtra;
    assert.ok(start+packed<=directory,'complete file payload');
    assert.ok(size>0 && size<=2_000_000,'bounded readable file');
    const payload=zip.subarray(start,start+packed);
    const data=method===8?inflateRawSync(payload,{maxOutputLength:2_000_000}):payload;
    assert.equal(data.length,size,name+' uncompressed size');
    let computed=0xffffffff;
    for(const byte of data){
      computed^=byte;
      for(let bit=0;bit<8;bit++)computed=(computed>>>1)^((computed&1)?0xedb88320:0);
    }
    assert.equal((computed^0xffffffff)>>>0,crc,name+' CRC-32');
    entries.set(name,data);
    cursor+=46+nameLength+extra+comment;
  }
  assert.equal(cursor,end,'all directory entries read');
  return entries;
}
